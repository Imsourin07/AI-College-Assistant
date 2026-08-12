package com.college.assistant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AiCollegeAssistantApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiCollegeAssistantApplication.class, args);
        System.out.println("\n=======================================================");
        System.out.println("🤖 AI College Assistant Backend Server Running on 8080!");
        System.out.println("=======================================================\n");
    }
}
