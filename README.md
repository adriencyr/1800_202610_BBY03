# futTalk


## Overview
futTalk is a full-stack web application designed to serve as a community hub forum for football fans and FIFA World Cup 2026 eventgoers alike. Our app boasts several intuitive features and integrations to ensure all event attendees can socialize with others, share valuable tips and overall enjoy the event without the friction of having to deal with several different platforms at once.

This was developed for the COMP1800 course, featuring a Firebase backend, User-Centred Design, and agile/scrum methodology, in line with the COMP1800 course outline.

---


## Features

- Browse a dynamic feed of community posts
- Create and publish new posts
- View detailed post pages with full content
- Upvote posts to highlight popular content
- Bookmark (favorite) posts for quick access later
- View a personalized list of bookmarked posts
- User authentication (sign up, login, logout)
- Protected pages (redirect users who are not logged in)
- Real-time UI updates for actions like bookmarking and posting
- Responsive design for both desktop and mobile devices
- Mobile-friendly navigation with bottom navigation bar and floating action buttons
- Dynamic loading of shared components (navbar, footer)
- Clean and modern UI using Bootstrap and custom CSS
- Backend integration with Firebase Authentication and Firestore for data storage

---


## Technologies Used

- Frontend: HTML, CSS, JavaScript, and [Bootstrap](https://getbootstrap.com/) for responsive design
- Build Tool: [Vite](https://vite.dev/) for fast development and module bundling
- Backend / Hosting: [Firebase Hosting](https://firebase.google.com/)
- Authentication: Firebase Authentication for user login and signup
- Database: Cloud Firestore for storing posts and user data
- Icons: Bootstrap Icons for UI elements
- Version Control: Git & GitHub
- Development Environment: Visual Studio Code

---


## Usage

To run the application locally:

1.  **Clone** the repository.
2.  **Install dependencies** by running `npm install` in the project root directory.
3.  **Start the development server** by running the command: `npm run dev`.
4.  Open your browser and visit the local address shown in your terminal (usually `http://localhost:5173` or similar).

Once the application is running:

1. Sign up for a new account or log in to an existing account.
2. Browse the community post feed on the main page.
3. Click on a post to view its full details.
4. Create a new post using the "+" (floating action button).
5. Bookmark posts to save them for later.
6. View your saved posts on the bookmarks page.

---


## Project Structure

```
1800_202610_BBY03/
├── .firebase/
├── components/
│   ├── footer.html
│   └── navbar.html
├── css/
│   ├── newpost.css
│   ├── post-details.css
│   ├── post.css
│   ├── reply.css
│   ├── search.css
│   ├── sera/
│   └── style.css
├── images/
├── js/
│   ├── authentication.js
│   ├── bookmark.js
│   ├── bookmarksPage.js
│   ├── firebaseConfig.js
│   ├── loginsignup.js
│   ├── main.js
│   ├── newpost.js
│   ├── post-details.js
│   ├── post.js
│   ├── reply.js
│   ├── search.js
│   └── settings.js
├── pages/
│   ├── bookmarks.html
│   ├── login.html
│   ├── newpost.html
│   ├── post-details.html
│   ├── post.html
│   ├── reply.html
│   ├── searchPage.html
│   └── settings.html
├── .firebaserc
├── .gitignore
├── README.md
├── firebase.json
├── index.html
├── package-lock.json
├── package.json
└── vite.config.js
```

---


## Contributors
- **Adrien Cyr**
- **Bhagat Takhar**
- **Daniel Uchechukwu-Moses**

---


## Acknowledgments

- Claude code used in Daniel U. code submissions.
- Code snippet adapted from Carly Orr for the avatar upload function (js/settings.js).

---


## Limitations and Future Work
### Limitations

- No real-time updates (users may need to refresh to see new posts or changes)
- Basic search functionality with limited filtering options
- UI/UX could be further refined for consistency across all pages
- Limited error handling and user feedback in some actions

### Future Work

- Add real-time updates using listeners (e.g., live post feed updates)
- Enhance search with filters (e.g., by category, popularity, date)
- Improve UI/UX design and accessibility across all devices
- Add user profiles with post history and personalization features
- Introduce notifications for interactions (e.g., likes, replies)
- Optimize performance and loading times

---


## License

This project is licensed under the MIT License. See the LICENSE file for details.
