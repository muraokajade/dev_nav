package com.example.tech.utils;

import com.example.tech.repository.ProcedureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("migrate-steps") // プロファイルで一度だけ起動
@RequiredArgsConstructor
public class StepBackfillRunner implements CommandLineRunner {
    private final ProcedureRepository repo;

    @Override
    public void run(String... args) {
        var all = repo.findAll();
        all.forEach(p -> {
            int[] v = StepNumber.parse(p.getStepNumber());
            p.setStepMajor(v[0]);
            p.setStepMinor(v[1]);
        });
        repo.saveAll(all);
        System.out.println("stepMajor/stepMinor backfilled: " + all.size());
    }
}

