package cit.edu.quizwhiz.service;

import cit.edu.quizwhiz.entity.AdminEntity;
import cit.edu.quizwhiz.entity.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
public class FirebaseUserDetailsService implements UserDetailsService {

    @Autowired
    private UserService userService;

    @Autowired
    private AdminService adminService;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("Attempting to load user by username: " + username);

        // Try finding in UserEntity
        Optional<UserEntity> userOpt = null;
        try {
            userOpt = userService.findByEmail(username);
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            return User.builder()
                    .username(user.getEmail())
                    .password("")
                    .authorities("USER")
                    .build();
        }

        // Try finding in AdminEntity
        Optional<AdminEntity> adminOpt = null;
        try {
            adminOpt = adminService.findByEmail(username);
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        if (adminOpt.isPresent()) {
            AdminEntity admin = adminOpt.get();
            return User.builder()
                    .username(admin.getEmail())
                    .password("")
                    .authorities("ADMIN")
                    .build();
        }

        throw new UsernameNotFoundException("User not found with email: " + username);
    }

}