package se.whispers.jokeservice;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class JokeController {

    private final List<String> privateJokes = List.of(
            "A chicken walked in to a library and said 'book book book, so the librarian got to the bookshelf and got her a book. The next day the chicken came back and said 'book book book', the librarian got her another book. The third day the chicken came back and said 'book book book', the librarian got her a third book. This time the librarian secretly followed the chicken to see what she was doing with all those books. She followed her to a pond where she saw the chicken showing the books to a frog. When the chicken showed the book to the frog the frog said 'readit'",
                    "A cow walked in to a strip club and said 'A class of milk please'. The bartender said 'we don't serve milk here, this is a strip club'. The cow said 'I know, I just wanted to see some udders'",
                    "A dove flew in to a restaurant and asked 'Do you scramble eggs here? The waiter said 'Yes actually, we do.' The dove said 'Great, I was looking for a place to have my abortion.'"
                    );

    @GetMapping("/random")
    public String getPrivateQuote() {
        int randomIndex = (int) (Math.random() * privateJokes.size());
        return privateJokes.get(randomIndex);
    }
}
