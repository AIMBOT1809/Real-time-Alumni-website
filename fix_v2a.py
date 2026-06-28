with open('c:/Users/Anthariksh/Real-time-Alumni-website/frontend/src/app/pages/MainDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add isSaving state
old1 = "  const [isDeletingPost, setIsDeletingPost] = useState(false);\n\n  useEffect"
new1 = "  const [isDeletingPost, setIsDeletingPost] = useState(false);\n  const [isSaving, setIsSaving] = useState(false);\n\n  useEffect"
if old1 in content:
    content = content.replace(old1, new1, 1)
    print("1. Added isSaving state")
else:
    print("1. Failed")

with open('c:/Users/Anthariksh/Real-time-Alumni-website/frontend/src/app/pages/MainDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Saved part 1")
