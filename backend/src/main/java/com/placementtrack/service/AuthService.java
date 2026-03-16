package com.placementtrack.service;

import com.placementtrack.dto.AuthDto;
import com.placementtrack.model.Student;
import com.placementtrack.repository.StudentRepository;
import com.placementtrack.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Student student = new Student();
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setProfileCompleted(false);

        student = studentRepository.save(student);

        String token = jwtUtil.generateToken(student.getEmail(), student.getId());
        return new AuthDto.AuthResponse(token, student.getId(), student.getName(),
                                        student.getEmail(), student.getProfileCompleted());
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        Student student = studentRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), student.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(student.getEmail(), student.getId());
        return new AuthDto.AuthResponse(token, student.getId(), student.getName(),
                                        student.getEmail(), student.getProfileCompleted());
    }
}
