package se.whispers.quoteservice;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/quotes")
public class QuoteController {
    private final List<String> privateQuotes = List.of(
            "You can't control your actions, you can only ask for forgiveness.",
            "Confusion is bliss.",
            "A mother never forgives."
    );

    @GetMapping("/private")
    public String getPrivateQuote() {
        int randomIndex = (int) (Math.random() * privateQuotes.size());
        return privateQuotes.get(randomIndex);
    }

    @GetMapping("/public")
    public String getPublicQuote() {
        return "Sometimes the friends you make along the way is the friends that stab you in the back. Always look behind you. Even if you're walking alone, there might be someone behind you. It might be a friend that you made along the way. Don't let him stab you in the back. Always be aware of your surroundings and look behind you. Search your back for stab marks. Be prepared for the worst.";
    }
}
