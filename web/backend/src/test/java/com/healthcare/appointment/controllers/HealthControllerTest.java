package com.healthcare.appointment.controllers;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import com.healthcare.appointment.config.SecurityConfig;
import com.healthcare.appointment.config.CorrelationIdFilter;

@WebMvcTest(HealthController.class)
@Import({ SecurityConfig.class, CorrelationIdFilter.class })
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthReturnsUp() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.service", is("healthcare-appointment-backend")));
    }

    @Test
    void healthGeneratesCorrelationIdWhenMissing() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Correlation-Id", not(blankOrNullString())));
    }

    @Test
    void healthPreservesProvidedCorrelationId() throws Exception {
        mockMvc.perform(get("/api/health")
                        .header("X-Correlation-Id", "test-correlation-id"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Correlation-Id", "test-correlation-id"));
    }
}
