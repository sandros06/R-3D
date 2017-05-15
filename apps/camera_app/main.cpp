#include <iostream>
#include <opencv2/core/mat.hpp>
#include <opencv2/imgcodecs.hpp>
#include "PositionDetector.h"

int main(int argc, char **argv)
{
    PositionDetector detector;

    for (int i = 1; i < argc-1; ++i) {
        cv::Mat img, img2;
        cv::Mat rot, tr;
        double r = 0.0;

        img = cv::imread(argv[i]);
        img2 = cv::imread(argv[i+1]);

        detector.findTransform(img, img2, rot, tr, &r);

        std::cout << rot << std::endl;
        std::cout << tr << std::endl;
    }

    return 0;
}