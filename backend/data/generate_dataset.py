import os
import pandas as pd
import numpy as np

# Ensure directory exists
os.makedirs("backend/data", exist_ok=True)

# 1. Official Train Schedules Reference Data
train_schedules = [
    # Train 12002: Bhopal Shatabdi Express (New Delhi to Rani Kamlapati)
    {"train_number": "12002", "train_name": "Bhopal Shatabdi", "station_code": "NDLS", "station_name": "New Delhi", "seq": 1, "dist_km": 0, "sched_arr": "06:00", "sched_dep": "06:15"},
    {"train_number": "12002", "train_name": "Bhopal Shatabdi", "station_code": "MTJ", "station_name": "Mathura Jn", "seq": 2, "dist_km": 141, "sched_arr": "07:40", "sched_dep": "07:42"},
    {"train_number": "12002", "train_name": "Bhopal Shatabdi", "station_code": "AGC", "station_name": "Agra Cantt", "seq": 3, "dist_km": 194, "sched_arr": "08:34", "sched_dep": "08:37"},
    {"train_number": "12002", "train_name": "Bhopal Shatabdi", "station_code": "GWL", "station_name": "Gwalior Jn", "seq": 4, "dist_km": 312, "sched_arr": "10:03", "sched_dep": "10:06"},
    {"train_number": "12002", "train_name": "Bhopal Shatabdi", "station_code": "VGLJ", "station_name": "Jhansi Jn", "seq": 5, "dist_km": 409, "sched_arr": "11:28", "sched_dep": "11:31"},
    {"train_number": "12002", "train_name": "Bhopal Shatabdi", "station_code": "BPL", "station_name": "Bhopal Jn", "seq": 6, "dist_km": 701, "sched_arr": "14:10", "sched_dep": "14:15"},
    {"train_number": "12002", "train_name": "Bhopal Shatabdi", "station_code": "RKMP", "station_name": "Rani Kamlapati", "seq": 7, "dist_km": 707, "sched_arr": "14:28", "sched_dep": "14:28"},

    # Train 12626: Kerala Express (New Delhi to Trivandrum)
    {"train_number": "12626", "train_name": "Kerala Express", "station_code": "NDLS", "station_name": "New Delhi", "seq": 1, "dist_km": 0, "sched_arr": "20:00", "sched_dep": "20:10"},
    {"train_number": "12626", "train_name": "Kerala Express", "station_code": "MTJ", "station_name": "Mathura Jn", "seq": 2, "dist_km": 141, "sched_arr": "22:20", "sched_dep": "22:25"},
    {"train_number": "12626", "train_name": "Kerala Express", "station_code": "AGC", "station_name": "Agra Cantt", "seq": 3, "dist_km": 194, "sched_arr": "23:20", "sched_dep": "23:25"},
    {"train_number": "12626", "train_name": "Kerala Express", "station_code": "GWL", "station_name": "Gwalior Jn", "seq": 4, "dist_km": 312, "sched_arr": "01:05", "sched_dep": "01:08"},
    {"train_number": "12626", "train_name": "Kerala Express", "station_code": "VGLJ", "station_name": "Jhansi Jn", "seq": 5, "dist_km": 409, "sched_arr": "02:35", "sched_dep": "02:43"},

    # Train 12190: Mahakaushal Express
    {"train_number": "12190", "train_name": "Mahakaushal Express", "station_code": "NZM", "station_name": "Hazrat Nizamuddin", "seq": 1, "dist_km": 0, "sched_arr": "12:40", "sched_dep": "12:50"},
    {"train_number": "12190", "train_name": "Mahakaushal Express", "station_code": "MTJ", "station_name": "Mathura Jn", "seq": 2, "dist_km": 134, "sched_arr": "14:45", "sched_dep": "14:50"},
    {"train_number": "12190", "train_name": "Mahakaushal Express", "station_code": "AGC", "station_name": "Agra Cantt", "seq": 3, "dist_km": 188, "sched_arr": "15:40", "sched_dep": "15:45"},
    {"train_number": "12190", "train_name": "Mahakaushal Express", "station_code": "GWL", "station_name": "Gwalior Jn", "seq": 4, "dist_km": 306, "sched_arr": "17:38", "sched_dep": "17:40"},
    {"train_number": "12190", "train_name": "Mahakaushal Express", "station_code": "VGLJ", "station_name": "Jhansi Jn", "seq": 5, "dist_km": 403, "sched_arr": "19:30", "sched_dep": "19:38"},

    # Train 22221: Rajdhani Express
    {"train_number": "22221", "train_name": "Rajdhani Express", "station_code": "MMCT", "station_name": "Mumbai Central", "seq": 1, "dist_km": 0, "sched_arr": "16:00", "sched_dep": "16:10"},
    {"train_number": "22221", "train_name": "Rajdhani Express", "station_code": "BPL", "station_name": "Bhopal Jn", "seq": 2, "dist_km": 838, "sched_arr": "03:15", "sched_dep": "03:20"},
    {"train_number": "22221", "train_name": "Rajdhani Express", "station_code": "VGLJ", "station_name": "Jhansi Jn", "seq": 3, "dist_km": 1130, "sched_arr": "06:45", "sched_dep": "06:50"},
    {"train_number": "22221", "train_name": "Rajdhani Express", "station_code": "AGC", "station_name": "Agra Cantt", "seq": 4, "dist_km": 1345, "sched_arr": "09:30", "sched_dep": "09:32"},
    {"train_number": "22221", "train_name": "Rajdhani Express", "station_code": "NDLS", "station_name": "New Delhi", "seq": 5, "dist_km": 1539, "sched_arr": "12:15", "sched_dep": "12:15"},

    # Train 11808: Intercity Express
    {"train_number": "11808", "train_name": "Intercity Express", "station_code": "AF", "station_name": "Agra Fort", "seq": 1, "dist_km": 0, "sched_arr": "06:00", "sched_dep": "06:10"},
    {"train_number": "11808", "train_name": "Intercity Express", "station_code": "AGC", "station_name": "Agra Cantt", "seq": 2, "dist_km": 4, "sched_arr": "06:30", "sched_dep": "06:35"},
    {"train_number": "11808", "train_name": "Intercity Express", "station_code": "GWL", "station_name": "Gwalior Jn", "seq": 3, "dist_km": 122, "sched_arr": "08:45", "sched_dep": "08:50"},
    {"train_number": "11808", "train_name": "Intercity Express", "station_code": "VGLJ", "station_name": "Jhansi Jn", "seq": 4, "dist_km": 219, "sched_arr": "10:40", "sched_dep": "10:50"},
]

df_schedules = pd.DataFrame(train_schedules)
df_schedules.to_csv("backend/data/train_schedules.csv", index=False)
print("Saved train_schedules.csv with", len(df_schedules), "records")

# 2. Synthetic Historical Running Dataset (10,000 historical section runs)
# Feature variables representing real physical railway mechanics:
# - current_delay_min: delay entering the section
# - section_length_km: distance between stations
# - section_max_speed: max allowed speed (km/h)
# - congestion_density: section traffic density (0 to 100%)
# - added_dwell_min: unplanned stoppage time (min)
# - speed_restriction_km: length of speed restricted track (km)
# - visibility_km: atmospheric visibility in km
# - day_of_week: day integer (0=Mon, 6=Sun)
# - train_priority: 3=Superfast/Shatabdi/Rajdhani, 2=Express, 1=Passenger/Intercity
# Target: actual_section_delay_change (in minutes, positive = additional delay, negative = recovered delay)

np.random.seed(42)
n_samples = 10000

train_priorities = np.random.choice([1, 2, 3], size=n_samples, p=[0.2, 0.5, 0.3])
current_delays = np.random.exponential(scale=12.0, size=n_samples) # Exponential delay distribution
section_lengths = np.random.uniform(20, 150, size=n_samples)
max_speeds = np.random.choice([110, 130, 160], size=n_samples, p=[0.5, 0.4, 0.1])
congestion = np.random.uniform(10, 95, size=n_samples)
added_dwells = np.random.exponential(scale=2.5, size=n_samples)
speed_restrictions = np.random.uniform(0, 40, size=n_samples) * (np.random.rand(n_samples) > 0.6)
visibility = np.random.uniform(0.5, 10.0, size=n_samples)
days = np.random.randint(0, 7, size=n_samples)

# Physical formula to simulate real-world delay change + Gaussian noise
# High priority trains get priority signaling and recover delay if congestion is low.
# High congestion and speed restrictions increase delay significantly.
base_travel_time = (section_lengths / max_speeds) * 60.0 # minutes

congestion_delay_impact = (congestion / 100.0) ** 1.8 * (section_lengths / 30.0) * (4.0 / train_priorities)
restriction_impact = (speed_restrictions / 10.0) * 3.5
visibility_impact = np.where(visibility < 2.0, (2.0 - visibility) * 4.0, 0.0)
dwell_impact = added_dwells

# Historical recovery behavior: high priority trains catching up on clear track
recovery_potential = np.where((current_delays > 5) & (congestion < 50) & (train_priorities >= 2),
                              -1.0 * np.minimum(current_delays * 0.3, section_lengths / 15.0), 0.0)

noise = np.random.normal(loc=0.0, scale=2.0, size=n_samples)

actual_delay_change = (
    congestion_delay_impact +
    restriction_impact +
    visibility_impact +
    dwell_impact +
    recovery_potential +
    noise
)

# Output dataset frame
historical_df = pd.DataFrame({
    "train_priority": train_priorities,
    "current_delay_min": np.round(current_delays, 2),
    "section_length_km": np.round(section_lengths, 2),
    "section_max_speed": max_speeds,
    "congestion_density": np.round(congestion, 2),
    "added_dwell_min": np.round(added_dwells, 2),
    "speed_restriction_km": np.round(speed_restrictions, 2),
    "visibility_km": np.round(visibility, 2),
    "day_of_week": days,
    "actual_delay_change_min": np.round(actual_delay_change, 2)
})

historical_df.to_csv("backend/data/historical_train_runs.csv", index=False)
print("Saved historical_train_runs.csv with", len(historical_df), "records")
