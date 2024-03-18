# MelpApp | Team Conferencing, Chat, Calendar and More 

# About
[MelpApp](https://melp.us/) supports you and your team to [Create, Communicate, and Collaborate](https://www.app.melp.us/spa/index#login) from anywhere and from any device. MelpApp offers rich, easy-to-use features that are essential for teamwork. You and your group can take advantage of chat, topic-based discussions, screen and application sharing, audio-video conferencing and meeting scheduling from one app. Your coworkers, team and network stay connected and stay productive while you enjoy the fruits of their work at low cost

# Try it out
Data is what empowers you, and your sensitive data is what differentiates you. With MelpApp, you can work worry-free, from anywhere anytime. MelpApp is a secure collaboration platform. We have prioritized your security and guarantee your confidential data is protected at all times.

* [Easy Conference](https://melp.us/feature#video_conference) - Phone calls and conference calls made easy. Use Melp to make calls and instantly connect with your coworkers and business network, remotely.
* [Smart discussions with teams](https://melp.us/feature#team_productivity) - Discuss multiple topics with your team.
* [Communicate with everyone, anywhere, anytime, securely](https://melp.us/feature#invite-external) - A superior and engaging group experience
* [Schedule & sync meetings without switching apps](https://melp.us/feature#smartCalendar) - Schedule meeting across your team with calculated time zone differences and zero conflicts..
* [Interactive Screen sharing](https://melp.us/feature#video_conference) - Make meetings doubly interactive with in-built co-annotation capability.
* [Real-time language translation](https://melp.us/feature#team_productivity) - Collaborate with diversified team members in your own language.
* [Sharing files, photos, documents and videos has never been easier](https://melp.us/feature#file-share) - All files shared within MelpApp stay within the app in a dedicated folder that has got enough space! Easy to access, it becomes your personal repository for as long as you want.

# Installation

## Requirements
- [Apache](https://www.apache.org//) >= **1.1**.
- [PHP](https://www.php.net/) >= **5.6**.
- [JQuery](https://jquery.com/) >= **3.4**.

`Below files/Libraries get automatically installed, when you setup Melpapp responsitory on your machine from Bit-Bucket`.

- [JS-Signals](https://millermedeiros.github.io/js-signals/) 
- [Hasher.js](https://github.com/millermedeiros/Hasher) 
- [Crossroads.js](https://millermedeiros.github.io/crossroads.js/) 
- [Firebase-Messaging](https://firebase.google.com/docs/cloud-messaging) = **8.1.1**
- [candy-chat](http://candy-chat.github.io/candy/) >= **2.2.0.3**  - [View Doc](https://github.com/igniterealtime/openfire-candy-plugin/releases/tag/v2.2.0.3)
- [EmojioneArea](https://github.com/mervick/emojionearea) >= **3.4.1**
- [Croppie](https://fengyuanchen.github.io/cropperjs) >= **2.4.1**
- [Summernote](https://github.com/HackerWins/summernote.git) >= **0.8.1**
- [Momentjs](https://momentjs.com/) >= **2.29.0**
- [Giphy](https://developers.giphy.com/docs/api#quick-start-guide)

### Manual install

**As any user (we recommend creating a separate user called melpapp):**

1. Move to a folder where you want to install Melpapp. Clone the git repository: `git clone --branch master http://134.209.30.40:7990/scm/mbrowse/melpsingleapp.git`
2. Change into the new directory containing the cloned source code: `cd melpsingleapp`
3. Open <https://localhost/melpsingleapp/index#/login> in your browser.

To update to the latest released version, execute `git pull origin`. 

# Next Steps

## Tweak the settings
- You can modify the URLs, file-version, end-points etc. in `constant.min.js`.
- You can modify the routing or create a new routing path in route.js

If you are planning to use MelpApp in a production environment, you should change the services end-points and base urls in `constant.min.js` file.

# FAQ
Visit the **[FAQ](https://melp.us/user-guide)**.

# License
[Apache License v2](http://www.apache.org/licenses/LICENSE-2.0.html)