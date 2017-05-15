//
// Created by thibaut on 14/05/17.
//

#include "PositionDetector.h"
#include <opencv2/xfeatures2d/nonfree.hpp>

using namespace cv;

PositionDetector::PositionDetector()
{
    m_descriptor = xfeatures2d::SIFT::create();
    m_matcher = cv::BFMatcher::create("BruteForce");
}

void PositionDetector::extractMatches(std::vector<DMatch> matches, float distance,
                    std::vector<KeyPoint> kp1, std::vector<Point> &out_query, std::vector<int> &out_query_i,
                    std::vector<KeyPoint> kp2, std::vector<Point> &out_train, std::vector<int> &out_train_i)
{
    for (DMatch &m: matches) {
        if (m.distance < distance) {
            out_query_i.push_back(m.queryIdx);
            out_train_i.push_back(m.trainIdx);

            out_query.push_back(kp1[m.queryIdx].pt);
            out_train.push_back(kp2[m.trainIdx].pt);
        }
    }
}

void PositionDetector::findTransform(const _InputArray &img1, const _InputArray &img2,
                                     const _OutputArray &rot, const _OutputArray &tr, double *r)
{
    const Mat mat1 = img1.getMat();
    const Mat mat2 = img2.getMat();

    Mat _rot, _tr;

    Mat gr1, gr2;

    cvtColor(mat1, gr1, COLOR_BGR2GRAY);
    cvtColor(mat2, gr2, COLOR_BGR2GRAY);

    std::vector<KeyPoint> kp1, kp2;
    Mat desc1, desc2;

    m_descriptor->detectAndCompute(gr1, noArray(), kp1, desc1);
    m_descriptor->detectAndCompute(gr2, noArray(), kp2, desc2);

    std::vector<DMatch> matches;

    m_matcher->match(gr1, gr2, matches, noArray());

    std::vector<Point> out_query;
    std::vector<int> out_query_i;
    std::vector<Point> out_train;
    std::vector<int> out_train_i;

    PositionDetector::extractMatches(matches, 150.0,
                   kp1, out_query, out_query_i,
                   kp2, out_train, out_train_i);

    Mat essentialMat, mask;
    Mat camera = Mat::eye(3, 3, CV_32F);

    essentialMat = findEssentialMat(out_query, out_train, camera, RANSAC, 0.900, 1.0, mask);

    recoverPose(essentialMat, out_query, out_train, camera, _rot, _tr, mask);

    if (!m_first_detection) {
        *r = findR(_rot, _tr, out_query_i, out_train, out_train_i,
              mask, camera, kp2.size());

    } else {
        m_first_detection = false;

        *r = 1.0;
    }

    m_prev_rot = _rot;
    m_prev_tr = _tr;
    m_prev_out_query = out_query;
    m_prev_out_train = out_train;
    m_prev_out_train_i = out_train_i;
    m_prev_mask = mask;
    m_prev_r = *r;

    rot.createSameSize(_rot, _rot.type());
    rot.assign(_rot);
    tr.createSameSize(_tr, tr.type());
    tr.assign(_tr);
}

double PositionDetector::findR(Mat _rot, Mat _tr, const std::vector<int> &out_query_i,
                             const std::vector<Point> &out_train, const std::vector<int> &out_train_i, Mat &mask,
                             const Mat &camera, const unsigned long maxKp) const
{
    Mat persp1, persp2, persp3;
    hconcat(camera, Mat::zeros(3, 1, CV_32F), persp1);
    hconcat(m_prev_rot, m_prev_tr, persp2);
    hconcat(_rot, _tr, persp3);

    std::vector<Point> corr_prev(maxKp, Point(-1, -1));
    std::vector<Point> corr_cur(maxKp, Point(-1, -1));
    std::vector<Point> corr_next(maxKp, Point(-1, -1));

    for (int i = 0; i < m_prev_out_query.size(); ++i) {
        if (m_prev_mask.at<int>(i) == 1) {
            corr_prev[m_prev_out_train_i[i]] = m_prev_out_query[i];
            corr_cur[m_prev_out_train_i[i]] = m_prev_out_train[i];
        }
    }

    for (int i = 0; i < out_train_i.size(); ++i) {
        if (mask.at<int>(i) == 1) {
            corr_next[out_query_i[i]] = out_train[i];
        }
    }

    for (int i = 0; i < corr_prev.size(); ++i) {
        if (corr_prev[i] == Point(-1, -1) || corr_cur[i] == Point(-1, -1) || corr_next[i] == Point(-1, -1)) {
            corr_prev.erase(corr_prev.begin() + i);
            corr_cur.erase(corr_cur.begin() + i);
            corr_next.erase(corr_cur.begin() + i);
        }
    }

    Mat tri1, tri2;
    triangulatePoints(persp1, persp2, corr_prev, corr_cur, tri1);
    triangulatePoints(persp2, persp3, corr_cur, corr_next, tri2);

    for (int i = 0; i < tri1.rows; ++i) {
        tri1.row(i) /= tri1.at<float>(i, 3);
        tri2.row(i) /= tri2.at<float>(i, 3);
    }

    // TODO moyenne à faire avec toutes les combinaisons de 2 éléments
    int count = 0;
    double sum = 0.0;
    for (int i = 0; i < tri1.rows - 1; ++i) {
            if (corr_prev[i] != Point(-1, -1) && corr_cur[i] != Point(-1, -1) && corr_prev[i] != Point(-1, -1)) {
                double n = norm(tri2.row(i + 1) - tri2.row(i));

                if (n != 0) {
                    count++;
                    sum += norm(tri1.row(i+1) - tri1.row(i)) / n;
                }
            }
        }

    return m_prev_r * (sum / count);
}
