package cit.edu.cardwise.config;

import jakarta.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;

@Configuration
public class JpaConfig {

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(EntityManagerFactoryBuilder builder, DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean factory = builder
                .dataSource(dataSource)
                .packages("cit.edu.cardwise.entity")
                .build();

        // Ensure the proxy implements the standard Jakarta EntityManagerFactory
        factory.setEntityManagerFactoryInterface(EntityManagerFactory.class);

        return factory;
    }

}
