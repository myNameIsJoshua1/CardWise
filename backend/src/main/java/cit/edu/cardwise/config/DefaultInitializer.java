package cit.edu.cardwise.config;

import cit.edu.cardwise.entity.AdminEntity;
import cit.edu.cardwise.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DefaultInitializer implements CommandLineRunner {

    @Autowired
    private AdminService adminService;

    @Override
    public void run(String... args) {
        String defaultEmail = "admin@cardwise.com";

        // Check if admin already exists
        if (adminService.findByEmail(defaultEmail).isEmpty()) {
            AdminEntity admin = new AdminEntity();
            admin.setFirstName("Default");
            admin.setLastName("Admin");
            admin.setEmail(defaultEmail);
            admin.setPassword("admin123"); // will be encoded by adminService

            adminService.createAdmin(admin);

            System.out.println("✔ Default admin account created!");
        } else {
            System.out.println("✔ Default admin already exists. Skipping creation.");
        }
    }
}
