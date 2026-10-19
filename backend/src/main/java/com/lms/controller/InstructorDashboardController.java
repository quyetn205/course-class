package com.lms.controller;

import com.lms.common.ApiResponse;
import com.lms.dto.response.InstructorDashboardResponse;
import com.lms.service.InstructorDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/instructor/dashboard")
@RequiredArgsConstructor
@Tag(name = "Instructor Dashboard", description = "Thống kê tổng quan hoạt động giảng dạy (Instructor)")
public class InstructorDashboardController {

    private final InstructorDashboardService instructorDashboardService;

    @GetMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Thống kê tổng quan hoạt động giảng dạy dành cho Giảng viên")
    public ResponseEntity<ApiResponse<InstructorDashboardResponse>> getDashboardStats(Authentication auth) {
        InstructorDashboardResponse response = instructorDashboardService.getDashboardStats(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
