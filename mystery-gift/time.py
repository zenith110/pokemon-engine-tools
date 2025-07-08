import datetime
import toml

# Load the TOML file
with open("gifts.toml", "r") as f:
    mystery_gifts = toml.load(f)

current_date = datetime.datetime.now()
end_date = current_date + datetime.timedelta(days=30)

# Update dates in the TOML structure
for gift in mystery_gifts["mysterygift"]:
    gift["beginningDate"] = current_date.isoformat()
    gift["endDate"] = end_date.isoformat()

# Save back to TOML
with open("gifts.toml", "w") as f:
    toml.dump(mystery_gifts, f)

print(f"Updated dates: {current_date} to {end_date}")
