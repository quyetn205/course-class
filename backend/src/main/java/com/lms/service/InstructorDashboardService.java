package com.lms.service;

import com.lms.dto.response.InstructorDashboardResponse;

public interface InstructorDashboardService {

    InstructorDashboardResponse getDashboardStats(String instructorEmail);
}
