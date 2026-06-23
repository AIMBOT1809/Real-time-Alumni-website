import os

files_to_modify = [
    r'src/app/pages/AdminDashboard.tsx',
    r'src/app/pages/AlumniNetwork.tsx',
    r'src/app/pages/Dashboard.tsx',
    r'src/app/pages/MainDashboard.tsx',
    r'src/app/pages/Register.tsx',
]

def replace_in_file(filepath, replacements):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Modified {filepath}")

# AdminDashboard
replace_in_file(files_to_modify[0], [
    ("role: 'alumni' | 'graduate' | 'higher-education';", "role: 'alumni' | 'career-aspirant' | 'higher-education';"),
    ("new Set(['alumni', 'graduate', 'higher-education'])", "new Set(['alumni', 'career-aspirant', 'higher-education'])"),
    ("item.role === 'graduate'", "item.role === 'career-aspirant'"),
    ("graduateCount", "careerAspirantCount"),
    ("graduateRatio", "careerAspirantRatio"),
    ("value=\"graduate\"", "value=\"career-aspirant\""),
    (">Graduate<", ">Career Aspirant<"),
    ("graduate: 'bg-amber-100", "'career-aspirant': 'bg-amber-100"),
    ("title: 'Graduate'", "title: 'Career Aspirant'"),
    ("name=\"Graduate\"", "name=\"Career Aspirant\""),
    ("role === 'graduate'", "role === 'career-aspirant'"),
])

# AlumniNetwork
replace_in_file(files_to_modify[1], [
    ("with graduates who", "with career aspirants who"),
    ("value=\"graduate\"", "value=\"career-aspirant\""),
    (">Recent Graduate<", ">Career Aspirant<"),
])

# Dashboard
replace_in_file(files_to_modify[2], [
    ("role === 'graduate'", "role === 'career-aspirant'"),
])

# MainDashboard
replace_in_file(files_to_modify[3], [
    ("return 'graduate'", "return 'career-aspirant'"),
])

# Register
replace_in_file(files_to_modify[4], [
    ("fellow graduates,", "fellow career aspirants,"),
])

print("Done replacing.")
