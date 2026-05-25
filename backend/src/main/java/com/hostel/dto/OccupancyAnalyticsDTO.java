package com.hostel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OccupancyAnalyticsDTO {
    private long occupied;
    private long available;
    private long underMaintenance;
    private double occupancyRate;
}
