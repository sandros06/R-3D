//
// Created by thibaut on 14/05/17.
//

#ifndef CAMERA_APP_POSITIONDETECTOR_H
#define CAMERA_APP_POSITIONDETECTOR_H


#include <opencv2/core/cvstd.hpp>
#include <cv.hpp>

class PositionDetector
{
public:
    PositionDetector();

    void findTransform(cv::InputArray img1, cv::InputArray img2,
                       cv::OutputArray rot, cv::OutputArray tr, double *r);

private:
    void extractMatches(std::vector<cv::DMatch> matches, float distance,
                                          std::vector<cv::KeyPoint> kp1, std::vector<cv::Point> &out_query, std::vector<int> &out_query_i,
                                          std::vector<cv::KeyPoint> kp2, std::vector<cv::Point> &out_train, std::vector<int> &out_train_i);

    double findR(cv::Mat _rot, cv::Mat _tr, const std::vector<int> &out_query_i, const std::vector<cv::Point> &out_train,
                 const std::vector<int> &out_train_i, cv::Mat &mask, const cv::Mat &camera, const unsigned long maxKp) const;

    cv::Ptr<cv::Feature2D> m_descriptor{};

    cv::Ptr<cv::DescriptorMatcher> m_matcher{};
    cv::Mat m_prev_rot{};

    cv::Mat m_prev_tr{};
    std::vector<cv::Point> m_prev_out_query;
    std::vector<cv::Point> m_prev_out_train;

    std::vector<int> m_prev_out_train_i;
    cv::Mat m_prev_mask;

    double m_prev_r;

    bool m_first_detection{true};
};


#endif //CAMERA_APP_POSITIONDETECTOR_H
