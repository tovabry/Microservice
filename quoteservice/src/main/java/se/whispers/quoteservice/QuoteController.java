package se.whispers.quoteservice;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class QuoteController {
    private final QuoteService quoteService;


    public QuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
    }

    @GetMapping("/random")
    public String getPrivateQuote() {
        return quoteService.getRandomQuote();
    }
}
