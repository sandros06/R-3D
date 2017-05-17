cmake_minimum_required(VERSION 3.6)
project(camera_app)

set(CMAKE_CXX_STANDARD 11)

find_package(OpenCV REQUIRED)

set(SOURCE_FILES main.cpp PositionDetector.cpp PositionDetector.h)
add_executable(camera_app ${SOURCE_FILES})
target_link_libraries(camera_app ${OpenCV_LIBS})