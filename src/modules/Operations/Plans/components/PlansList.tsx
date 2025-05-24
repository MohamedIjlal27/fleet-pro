import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import PlansCard from "./PlanCard";
import { fetchPlans } from "../apis/apis"; // Import the API function

interface PlansListProps {
    loadPlans: () => void;
    plans: [];
    loading: boolean;
}

const PlansList: React.FC<PlansListProps> = ({ loadPlans, plans, loading }) => {
    return (
        <Grid container spacing={3}>
            {loading ? (
                <div>Loading...</div> // Show a loading message while fetching data
            ) : plans.length > 0 ? (
                plans.map((plan, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <PlansCard
                            loadPlans={loadPlans}
                            id={plan.id}
                            name={plan.name}
                            description={`${plan.description}`}
                            pricing={plan.pricing}
                            deposit={plan.deposit}
                            chargePeriod={plan.chargePeriod}
                            duration={plan.duration}
                            durationAdditional={plan.durationAdditional}
                            durationPrice={plan.durationPrice}
                            distance={plan.distance}
                            distanceAdditional={plan.distanceAdditional}
                            distancePrice={plan.distancePrice}
                            services={JSON.parse(plan.services)}
                            organization={plan.organization}
                            planVehicles={plan.planVehicles}
                        />
                    </Grid>
                ))
            ) : (
                <div>No plans available</div> // Handle the case when no plans are available
            )}
        </Grid>
    );
};

export default PlansList;
