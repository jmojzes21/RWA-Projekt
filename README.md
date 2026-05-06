
# Project from Development of Web Application course

I developed a web application about series called "Moje serije".
The project requirement was that everything must be in the native language.

<p>
Moje serije is a web application for viewing series created in the Development of Web
Application course. The goal of this project was to develop both a backend and a frontend part
of a web application.
</p>

<p>Features:</p>
<ul>
  <li>
    Usage of an external service (<a href="https://developer.themoviedb.org/docs/getting-started" target="_blank">TMDB API</a>)
  </li>
  <li>Usage of pagination to limit the showing a huge amount of data</li>
  <li>Integrating ReCAPTCHA on forms to prevent bots</li>
  <li>Two-factor authentication</li>
  <li>User authorization, different content for guests, basic and admin users</li>
  <li>OAuth login using GitHub</li>
</ul>

## Technology stack
<ul>
  <li><b>Frontend:</b> Angular, TypeScript</li>
  <li><b>Backend:</b> Node.js, Express.js, JavaScript</li>
  <li><b>Database:</b> SQLite</li>
</ul>

## Run project

There are multiple ways to run the project.

### Development mode

In this mode, both the Angular app and the backend must be running.
* Start backend
* Run commands: `cd server`, `npm run dev`
* Start Angular app
* Run commands `cd angular`, `npm run start`

### Production mode

In this mode, only backend is running.

* Build Angular app
* Run commands: `cd angular`, `npm run build`
* Copy content of `angular/dist/serije/browser` to `server/angular`
* Run backend: `cd server`, `npm run start`

## Repository structure

| Directory | Description |
|-|-|
| angular | Frontned: Angular web application |
| server | Backend: Node.js, Express.js |

## Project gallery
* [Link to project gallery](https://jmojzes21.github.io/portfolio_page/projects/moje-serije#gallery)

