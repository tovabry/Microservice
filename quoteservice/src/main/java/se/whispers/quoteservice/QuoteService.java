package se.whispers.quoteservice;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuoteService {

    private final List<String> randomQuotes = List.of(
            "You can't control your actions, you can only ask for forgiveness.",
            "Confusion is bliss.",
            "A mother never forgives.",
            "Sometimes the friends you make along the way is the friends that stab you in the back. Always look behind you. Even if you're walking alone, there might be someone behind you. It might be a friend that you made along the way. Don't let him or her stab you in the back. Always be aware of your surroundings and look behind you. Search your back for stab marks. If there's any marks you should confront your friend and ask them why they stabbed you in the back. If they don't have a good reason you should cut them out of your life."
    );

    public String getRandomQuote() {
        int randomIndex = (int) (Math.random() * randomQuotes.size());
        return randomQuotes.get(randomIndex);
    }

}
