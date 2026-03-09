import json

# Manual curation of history data with coordinates
# To replace the hardcoded HISTORY_DB in App.jsx

history_events = [
    {"year": 1603, "label": "Queen Elizabeth I dies", "region": "UK", "type": "political", "lat": 51.461, "lon": -0.279}, # Richmond Palace
    {"year": 1605, "label": "Gunpowder Plot", "region": "UK", "type": "political", "lat": 51.499, "lon": -0.124}, # Parliament
    {"year": 1607, "label": "Jamestown Founded", "region": "USA", "type": "era", "lat": 37.2102, "lon": -76.7777},
    {"year": 1611, "label": "King James Bible Published", "region": "UK", "type": "culture", "lat": 51.5074, "lon": -0.1278},
    {"year": 1616, "label": "Shakespeare dies", "region": "UK", "type": "culture", "lat": 52.1917, "lon": -1.7083}, # Stratford-upon-Avon
    {"year": 1620, "label": "Mayflower Arrives", "region": "USA", "type": "era", "lat": 41.9584, "lon": -70.6673}, # Plymouth
    {"year": 1625, "label": "Charles I becomes King", "region": "UK", "type": "political", "lat": 51.5074, "lon": -0.1278},
    {"year": 1630, "label": "Boston Founded", "region": "USA", "type": "era", "lat": 42.3601, "lon": -71.0589},
    {"year": 1636, "label": "Harvard College Founded", "region": "USA", "type": "education", "lat": 42.3736, "lon": -71.1097},
    {"year": 1642, "label": "English Civil War Begins", "region": "UK", "type": "war", "lat": 52.9548, "lon": -1.1542}, # Nottingham (Standard raised)
    {"year": 1649, "label": "Charles I Executed", "region": "UK", "type": "political", "lat": 51.5033, "lon": -0.1276}, # Whitehall
    {"year": 1660, "label": "The Restoration", "region": "UK", "type": "political", "lat": 51.5074, "lon": -0.1278},
    {"year": 1664, "label": "New Amsterdam becomes New York", "region": "USA", "type": "political", "lat": 40.7128, "lon": -74.0060},
    {"year": 1665, "label": "Great Plague of London", "region": "UK", "type": "health", "lat": 51.5074, "lon": -0.1278},
    {"year": 1666, "label": "Great Fire of London", "region": "UK", "type": "disaster", "lat": 51.5074, "lon": -0.1278},
    {"year": 1675, "label": "King Philip's War", "region": "USA", "type": "war", "lat": 41.7658, "lon": -72.6734}, # New England widespread
    {"year": 1688, "label": "Glorious Revolution", "region": "UK", "type": "political", "lat": 50.4165, "lon": -3.5262}, # Torbay (Landing)
    {"year": 1692, "label": "Salem Witch Trials", "region": "USA", "type": "event", "lat": 42.5195, "lon": -70.8967},
    {"year": 1707, "label": "Act of Union (Great Britain)", "region": "UK", "type": "political", "lat": 51.5074, "lon": -0.1278},
    {"year": 1714, "label": "George I becomes King", "region": "UK", "type": "political", "lat": 51.5074, "lon": -0.1278},
    {"year": 1754, "label": "French and Indian War Begins", "region": "USA", "type": "war", "lat": 39.8136, "lon": -79.6225}, # Jumonville Glen (PA)
    {"year": 1760, "label": "Industrial Revolution Begins", "region": "UK", "type": "economy", "lat": 53.4808, "lon": -2.2426}, # Manchester (symbolic)
    {"year": 1765, "label": "Stamp Act", "region": "USA", "type": "political", "lat": 40.7128, "lon": -74.0060}, # NYC (Congress)
    {"year": 1770, "label": "Boston Massacre", "region": "USA", "type": "event", "lat": 42.3588, "lon": -71.0574},
    {"year": 1773, "label": "Boston Tea Party", "region": "USA", "type": "event", "lat": 42.3536, "lon": -71.0526},
    {"year": 1775, "label": "Revolutionary War Begins", "region": "USA", "type": "war", "lat": 42.4473, "lon": -71.2272}, # Lexington
    {"year": 1776, "label": "Declaration of Independence", "region": "USA", "type": "political", "lat": 39.9489, "lon": -75.1500}, # Philadelphia
    {"year": 1781, "label": "Battle of Yorktown", "region": "USA", "type": "war", "lat": 37.2387, "lon": -76.5097},
    {"year": 1787, "label": "US Constitution Signed", "region": "USA", "type": "political", "lat": 39.9489, "lon": -75.1500},
    {"year": 1789, "label": "Washington becomes President", "region": "USA", "type": "politics", "lat": 40.7061, "lon": -74.0112}, # NYC Inauguration
    {"year": 1789, "label": "French Revolution Begins", "region": "Europe", "type": "political", "lat": 48.8566, "lon": 2.3522, "global": True},
    {"year": 1793, "label": "Cotton Gin Invented", "region": "USA", "type": "tech", "lat": 32.0835, "lon": -81.0998}, # Savannah, GA area
    {"year": 1801, "label": "United Kingdom formed", "region": "UK", "type": "political", "lat": 51.5074, "lon": -0.1278},
    {"year": 1803, "label": "Louisiana Purchase", "region": "USA", "type": "politics", "lat": 29.9511, "lon": -90.0715}, # New Orleans transfer
    {"year": 1804, "label": "Napoleon becomes Emperor", "region": "Global", "type": "political", "lat": 48.8566, "lon": 2.3522, "global": True},
    {"year": 1805, "label": "Battle of Trafalgar", "region": "UK", "type": "war", "lat": 36.1833, "lon": -6.0333, "global": True},
    {"year": 1812, "label": "War of 1812", "region": "USA", "type": "war", "lat": 38.8977, "lon": -77.0365, "global": True},
    {"year": 1815, "label": "Battle of Waterloo", "region": "Global", "type": "war", "lat": 50.6793, "lon": 4.4120, "global": True},
    {"year": 1825, "label": "Erie Canal Opens", "region": "USA", "type": "economy", "lat": 42.6526, "lon": -73.7562}, # Albany end
    {"year": 1830, "label": "Liverpool and Manchester Railway", "region": "UK", "type": "tech", "lat": 53.4084, "lon": -2.9916},
    {"year": 1837, "label": "Queen Victoria Crowned", "region": "UK", "type": "political", "lat": 51.5074, "lon": -0.1278},
    {"year": 1837, "label": "Panic of 1837", "region": "USA", "type": "economy", "lat": 40.7128, "lon": -74.0060},
    {"year": 1845, "label": "Irish Potato Famine", "region": "Global", "type": "disaster", "lat": 53.1424, "lon": -7.6921, "global": True},
    {"year": 1848, "label": "California Gold Rush", "region": "USA", "type": "era", "lat": 38.8026, "lon": -120.8901}, # Sutter's Mill (Coloma, CA)
    {"year": 1851, "label": "The Great Exhibition", "region": "UK", "type": "culture", "lat": 51.5025, "lon": -0.1690}, # Hyde Park
    {"year": 1854, "label": "Crimean War", "region": "Global", "type": "war", "lat": 44.6167, "lon": 33.5254, "global": True},
    {"year": 1859, "label": "On the Origin of Species", "region": "Global", "type": "science", "lat": 51.3683, "lon": 0.0461, "global": True}, # Down House
    {"year": 1861, "label": "Civil War Begins", "region": "USA", "type": "war", "lat": 32.7522, "lon": -79.8747, "global": True}, # Fort Sumter - High impact
    {"year": 1863, "label": "Emancipation Proclamation", "region": "USA", "type": "politics", "lat": 38.8977, "lon": -77.0365},
    {"year": 1865, "label": "Lincoln Assassinated", "region": "USA", "type": "politics", "lat": 38.8964, "lon": -77.0262}, # Ford's Theatre
    {"year": 1869, "label": "Transcontinental Railroad", "region": "USA", "type": "tech", "lat": 41.6174, "lon": -112.5518}, # Promontory Summit, UT
    {"year": 1871, "label": "Great Chicago Fire", "region": "USA", "type": "disaster", "lat": 41.8781, "lon": -87.6298}, # Added as context expansion
    {"year": 1876, "label": "Telephone Invented", "region": "USA", "type": "tech", "lat": 42.3601, "lon": -71.0589}, # Boston
    {"year": 1879, "label": "Lightbulb Invented", "region": "USA", "type": "tech", "lat": 40.5362, "lon": -74.3729}, # Menlo Park, NJ
    {"year": 1888, "label": "Jack the Ripper Murders", "region": "UK", "type": "event", "lat": 51.5173, "lon": -0.0735}, # Whitechapel
    {"year": 1893, "label": "Panic of 1893", "region": "USA", "type": "economy", "lat": 40.7128, "lon": -74.0060},
    {"year": 1903, "label": "First Flight", "region": "USA", "type": "tech", "lat": 36.0199, "lon": -75.6688}, # Kitty Hawk, NC
    {"year": 1906, "label": "San Francisco Earthquake", "region": "USA", "type": "disaster", "lat": 37.7749, "lon": -122.4194},
    {"year": 1912, "label": "Titanic Sinks", "region": "Global", "type": "disaster", "lat": 41.7325, "lon": -49.9469, "global": True},
    {"year": 1914, "label": "World War I Begins", "region": "Global", "type": "war", "lat": 43.8563, "lon": 18.4131, "global": True}, # Sarajevo
    {"year": 1918, "label": "Spanish Flu Pandemic", "region": "Global", "type": "health", "lat": 39.1836, "lon": -96.5717, "global": True}, # First case KS
    {"year": 1929, "label": "Wall Street Crash", "region": "USA", "type": "economy", "lat": 40.7061, "lon": -74.0092}, # NYC
    {"year": 1939, "label": "World War II Begins", "region": "Global", "type": "war", "lat": 52.5200, "lon": 13.4050, "global": True},
    {"year": 1941, "label": "Pearl Harbor Attack", "region": "USA", "type": "war", "lat": 21.3445, "lon": -157.9749},
    {"year": 1945, "label": "Atomic Bomb / WWII Ends", "region": "Global", "type": "war", "lat": 34.3853, "lon": 132.4553, "global": True}
]

output_path = 'kinship-app/src/history_data.json'
with open(output_path, 'w') as f:
    json.dump(history_events, f, indent=4)

print(f"Written {len(history_events)} events to {output_path}")
