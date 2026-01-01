# Building a Campus Super App: My Hackathon Journey with React Native and AI

When I started this hackathon, I had a simple observation: students at my campus were juggling five different apps just to get through a normal day. One app for attendance, another for the library, a third for food orders, and separate platforms for academic help and campus announcements. It was fragmented, inefficient, and honestly, frustrating.

I decided to build something different: a unified Campus Super App that brings everything together. This is the story of how I built it, the challenges I faced, and what I learned along the way.

## The Problem: Fragmented Campus Life

Campus life shouldn't require a dozen apps. But that's exactly what most students deal with. Beyond the app overload, there were deeper issues:

**Proxy attendance** was rampant. Students would mark attendance for friends who weren't even on campus. The existing systems had no way to verify physical presence.

**Low engagement** in peer learning. Students had questions but no easy way to get help from peers. Discussion forums existed but were buried in separate platforms that nobody checked regularly.

**Information overload**. Important notices got lost in email threads. Library availability, food menus, and marketplace listings were scattered across different channels.

I wanted to solve these problems with a single, well-designed mobile app that students would actually want to use.

## The Solution: Campus Super App

I built an Android app using React Native (Expo) that unifies essential campus services:

- **Location-based attendance** with GPS verification using the Vincenty formula for sub-meter precision
- **Peer learning hub** with subjects, topics, and video lectures
- **AI-powered academic assistant** using Google's Gemini API for instant help
- **Dual dashboards** for students and instructors with role-based access
- **Quick access modules** for library, food ordering, campus marketplace, and discussion forums

The tech stack: React Native with Expo for cross-platform development, Supabase for backend and authentication, Auth0 for secure OAuth, and Gemini AI for the academic assistant.

## How Kiro Helped Me Build This

I used Kiro as my development assistant throughout this project, and it fundamentally changed how I approached building the app. Here's how:

### Planning and Feature Breakdown

Instead of diving straight into code, I used Kiro to help me think through the architecture. I would describe a feature in plain language, and Kiro helped me break it down into concrete components and data models.

For example, when I said "I need location-based attendance," Kiro helped me think through:
- What data structures do I need? (attendance_sessions, attendance_records, classes)
- How do I verify location? (GPS sampling, distance calculation algorithms)
- What's the user flow? (instructor starts session → student marks attendance → system verifies location)

This planning phase saved me from rewriting code later because I had a clear mental model before I started.

### Writing Better Prompts for AI Features

The AI academic assistant was one of the trickiest features. I needed to integrate Gemini API, but I also needed to structure the prompts correctly so the AI would give helpful, contextual responses.

Kiro helped me understand how to:
- Structure system prompts to set the AI's role as a campus tutor
- Include conversation history for context
- Handle API errors gracefully
- Format responses for mobile display

Instead of trial-and-error with API calls, I could ask Kiro "how should I structure this prompt?" and get practical guidance.

### Breaking Down Complex Problems

The GPS-based attendance verification was mathematically complex. I needed to:
1. Collect multiple GPS samples for accuracy
2. Calculate weighted averages based on GPS precision
3. Use the Vincenty formula (not just simple Haversine) for accurate distance calculation
4. Account for 3D distance including elevation

Kiro helped me understand each piece individually, then showed me how to combine them. The code comments in my implementation actually explain the math, which made debugging much easier.

### Maintaining Code Quality Under Time Pressure

During a hackathon, it's tempting to write messy code just to get features working. Kiro helped me maintain structure by:
- Suggesting consistent file organization (screens, components, lib)
- Helping me write reusable components instead of duplicating code
- Catching potential bugs before I ran into them
- Explaining React Native best practices I wasn't familiar with

The result was code I could actually understand and modify later, not a tangled mess.

## Planning Under Time Constraints

Hackathons force you to prioritize ruthlessly. I had ideas for a dozen features but only 48 hours to build. Here's how I approached it:

### Core Features First

I identified two must-have features:
1. **Attendance system** - This solved the biggest pain point (proxy attendance)
2. **Student dashboard** - This provided the foundation for everything else

Everything else was secondary. If I ran out of time, I could still demo a working app with these two features.

### Progressive Enhancement

I built features in layers:
- First: Basic attendance marking (no GPS)
- Second: Add GPS verification
- Third: Add instructor dashboard
- Fourth: Add learning hub
- Fifth: Integrate AI assistant

This approach meant I always had a working app. Each layer added value but wasn't blocking.

### Trade-offs I Made

**Skipped user testing**: Normally you'd test with real users. I didn't have time, so I relied on my own experience as a student to guide UX decisions.

**Simplified the marketplace**: Originally planned a full e-commerce flow with payments. Scaled back to just listings and contact info.

**Hardcoded campus location**: In production, this should be configurable per campus. For the hackathon, I hardcoded my campus coordinates.

**Limited error handling**: The app handles common errors, but edge cases might break things. That's okay for a prototype.

These trade-offs were conscious decisions. I knew what I was sacrificing and why.

## Challenges and How I Solved Them

### Challenge 1: Gemini API Key Issues

**The problem**: I integrated the Gemini API for the AI assistant, but kept getting authentication errors. The API key was in my `.env.local` file, but the app couldn't read it.

**What I tried**: 
- Checked the API key was correct (it was)
- Verified the environment variable name
- Restarted the Expo dev server multiple times

**The solution**: Expo requires a specific prefix for environment variables: `EXPO_PUBLIC_`. I was using `GEMINI_API_KEY` but needed `EXPO_PUBLIC_GEMINI_API_KEY`. Once I renamed it and restarted, everything worked.

**Lesson learned**: Read the framework documentation carefully. Different frameworks have different conventions for environment variables.

### Challenge 2: Supabase RLS Policies

**The problem**: After setting up Supabase authentication, I could sign in, but couldn't read or write any data. Every database query returned empty results or permission errors.

**What I tried**:
- Checked my Supabase connection (it was fine)
- Verified the table schemas existed (they did)
- Tested queries in the Supabase dashboard (they worked there)

**The solution**: Row Level Security (RLS) was enabled on my tables, but I hadn't created any policies. Supabase blocks all access by default when RLS is on. I needed to create policies that allowed authenticated users to read/write their own data.

For example, for the attendance_records table:
```sql
CREATE POLICY "Students can view their own attendance"
ON attendance_records FOR SELECT
USING (auth.uid() = student_id);
```

**Lesson learned**: Security-first databases require explicit permissions. This is good for production but can be confusing during development.

### Challenge 3: GPS Location Permissions

**The problem**: The attendance feature needed GPS access, but the app would crash when requesting permissions on Android.

**What I tried**:
- Added permissions to `app.json` (still crashed)
- Tested on different Android versions
- Checked Expo documentation

**The solution**: I needed to request permissions at runtime, not just declare them in the manifest. Used `expo-location`'s `requestForegroundPermissionsAsync()` before accessing location. Also needed to handle the case where users deny permission gracefully.

**Lesson learned**: Mobile permissions are runtime, not install-time. Always handle denial cases.

### Challenge 4: Time Management

**The problem**: With 48 hours and ambitious features, I was constantly behind schedule.

**What I tried**:
- Working longer hours (led to burnout and bugs)
- Cutting features mid-development (wasted time on half-built features)

**The solution**: I created a strict priority list and stuck to it. When I hit the 36-hour mark, I stopped adding features and focused only on polish and bug fixes. I also timebox each feature: if it wasn't working after 3 hours, I moved on.

**Lesson learned**: Shipping a polished subset is better than shipping a buggy everything. Know when to stop.

## What I Learned

### Real-World App Development is Different

In tutorials, everything works perfectly. In real projects:
- APIs have rate limits and authentication quirks
- Databases need proper security policies
- Mobile devices have permission systems
- Users have slow internet connections

This hackathon taught me to think about these real-world constraints from the start.

### Full-Stack Development is Humbling

I came in thinking I knew React Native. I left realizing how much I didn't know about:
- Backend architecture and database design
- Authentication flows and security
- Mobile-specific concerns like permissions and offline support
- API integration and error handling

Each feature touched multiple parts of the stack. I had to learn quickly.

### AI Integration is Powerful but Tricky

Adding Gemini AI made the app feel magical. Students could ask questions and get instant, contextual help. But:
- API costs add up quickly (I hit my free tier limit during testing)
- Prompt engineering matters more than I expected
- Error handling is critical (APIs fail, networks drop)
- Response formatting for mobile is non-trivial

AI is a tool, not magic. You still need to design the experience carefully.

### Solo Development Has Trade-offs

I built this alone, which meant:
- **Pros**: Fast decisions, consistent code style, no coordination overhead
- **Cons**: No one to review my code, limited perspective on UX, all debugging fell on me

For a hackathon, solo worked. For a real product, I'd want a team.

## The Impact

By the end of the hackathon, I had a working app that:
- Prevents proxy attendance using GPS verification
- Provides a unified dashboard for campus services
- Offers AI-powered academic help
- Organizes peer learning content
- Works on any Android device

More importantly, I validated that students actually want this. When I demoed it to classmates, the response was immediate: "When can I download this?"

## What I Would Improve

If I had more time (or built a v2), I'd focus on:

**Offline support**: The app currently requires internet. Students in areas with poor connectivity can't use it.

**Push notifications**: Instructors should be able to send attendance reminders. Students should get notified about new learning content.

**Analytics dashboard**: Instructors need insights into attendance patterns and student engagement.

**Multi-campus support**: Right now it's hardcoded for one campus. Should support multiple institutions.

**Better error messages**: When something fails, the app should explain what went wrong and how to fix it.

**Accessibility**: I didn't test with screen readers or consider users with disabilities. That's a gap.

## Final Thoughts

Building this app taught me more than any tutorial could. I learned to:
- Break down complex problems into manageable pieces
- Make trade-offs under time pressure
- Debug real-world integration issues
- Think about users, not just features

The code isn't perfect. There are bugs I didn't have time to fix. Some features are half-baked. But it works, it solves real problems, and it demonstrates what's possible when you focus on user needs.

Most importantly, I learned that building for real users is different from building for practice. Real users have messy workflows, unreliable internet, and diverse needs. Designing for that reality is the hard part.

If you're considering building something for a hackathon, my advice: pick a real problem you understand, build the core solution first, and don't be afraid to cut features. A working prototype that solves one problem well beats a broken app that tries to do everything.

Thanks for reading. If you want to see the code or try the app, feel free to reach out.

---

*Built with: React Native, Expo, Supabase, Auth0, Google Gemini AI*

*Hackathon: [Your Hackathon Name]*

*GitHub: [Your GitHub Link]*
