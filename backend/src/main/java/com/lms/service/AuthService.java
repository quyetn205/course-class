package com.lms.service;

import com.lms.dto.request.LoginRequest;
import com.lms.dto.response.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);
}
