package se.whispers.jokeservice;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class JokeController {

    private final JokeService jokeService;

    public JokeController(JokeService jokeService) {
        this.jokeService = jokeService;
    }
    @GetMapping("/random")
    public String getRandomJoke() {
        return jokeService.getRandomJokes();
    }

}
