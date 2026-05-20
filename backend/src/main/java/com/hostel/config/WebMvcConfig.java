package com.hostel.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * WebMvcConfig — global pagination safety limits.
 *
 * FIX (B5 from audit): Without this, a client could request ?size=1000000
 * causing the database to load millions of rows into memory → OOM.
 *
 * Limits:
 * - Default page size: 10
 * - Max page size: 100
 * - Default page: 0 (first page)
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        PageableHandlerMethodArgumentResolver resolver = new PageableHandlerMethodArgumentResolver();
        resolver.setFallbackPageable(PageRequest.of(0, 10));
        resolver.setMaxPageSize(100);
        resolvers.add(resolver);
    }
}
