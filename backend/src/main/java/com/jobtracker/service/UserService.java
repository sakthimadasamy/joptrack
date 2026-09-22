package com.jobtracker.service;

import com.jobtracker.dto.ChangePasswordRequest;
import com.jobtracker.dto.UpdateProfileRequest;
import com.jobtracker.dto.UserProfileDto;
import com.jobtracker.entity.User;
import com.jobtracker.exception.DuplicateEmailException;
import com.jobtracker.exception.InvalidCredentialsException;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileDto getProfile(Long userId) {
        User user = findUser(userId);
        return toDto(user);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUser(userId);

        String newEmail = request.getEmail().toLowerCase().trim();
        if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
            throw new DuplicateEmailException("An account with this email already exists.");
        }

        user.setName(request.getName());
        user.setEmail(newEmail);
        user = userRepository.save(user);

        return toDto(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findUser(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private UserProfileDto toDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
