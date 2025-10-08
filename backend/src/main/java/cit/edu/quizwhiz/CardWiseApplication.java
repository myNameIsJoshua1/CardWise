package cit.edu.quizwhiz;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

import java.io.*;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class CardWiseApplication {

	public static void main(String[] args) throws IOException {
		ClassLoader classLoader = CardWiseApplication.class.getClassLoader();

		InputStream serviceAccount = CardWiseApplication.class
				.getClassLoader()
				.getResourceAsStream("serviceAccountKey.json");

		if (serviceAccount == null) {
			throw new FileNotFoundException("serviceAccountKey.json not found in resources.");
		}

		FirebaseOptions options = new FirebaseOptions.Builder()
				.setCredentials(GoogleCredentials.fromStream(serviceAccount))
				.setProjectId("quizwhiz-flashcards")

				.setDatabaseUrl("https://quizwhiz-flashcards-default-rtdb.firebaseio.com")
				.build();

		FirebaseApp.initializeApp(options);

		SpringApplication.run(CardWiseApplication.class, args);
	}

}

