## CIS 550 Database and Information Systems Final Project
---

### Project Name: NBA Central

_This is the project completed for Penn CIS 550 Database and Information Systems course, Spring 2024. All rights reserved._

### Team Members

- Weichen (Eric) Song (esswc@seas.upenn.edu)
- Ziyang (Sid) Zhang (sidz314@seas.upenn.edu)
- Chenkang (Stephen) Zhang (stezhang@seas.upenn.edu)
- Runqi (Vickie) Liu (vickiliu@seas.upenn.edu)

##

### Project Description

The motivation behind the project is to create a dynamic and user-friendly website application serving as a centralized platform for accessing NBA data from session 2004 to session 2022. The goal is to provide basketball enthusiasts with an interactive platform where they can explore comprehensive player profiles, team information, and detailed game statistics.

Through interactive interfaces, users will be able to explore comprehensive player profiles, including per game statistics and highlights. Team information will provide insights championship wins and performance metrics over the specified period. Detailed game statistics will be available for every NBA game played during this timeframe, allowing users to analyze scores, player performances, team statistics, and game summaries. By incorporating interactive elements such as filters, sorting options, and visualization tools, the website aims to provide an engaging and informative experience for basketball enthusiasts to approach NBA with numerical support.

The website will be built using a combination of front-end and back-end technologies. The front-end will be developed using JavaScript, React, Material UI, while the back-end will be powered by AWS RDS MySQL database. The project also use Python and Pandas for data processing and analysis.

### Data Sources

The data for this project will be sourced from the following APIs:

- In total, we are using 5 datasets from: [NBA Dataset Kaggle](https://www.kaggle.com/datasets/nathanlauga/nba-games?select=games.csv).

##

### Dependencies
- Exploratory Data Analysis & Data Processing:
  Python: Pandas, Matplotlib
- Back End
   JavaScript: Node.js, Express.js
   MySQL
   AWS RDS
- Front End
   JavaScript: React, Material UI, Recharts

*Making sure you have all the dependencies installed before you run the project.*

### How to run the project

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. To install the required dependencies, run the following command:
   ```
   npm install
   ```
   *Make sure you have Node.js installed on your machine.*
4. To start the project, run the following command in two separate terminals:
   ```
    cd server
    npm start
    cd client
    npm start
    ```
5. The project will be running on `http://localhost:3000/`.

##

### Acknowledgements

We would like to thank the CIS 550 teaching team for their guidance and support throughout the project. We would also like to thank the NBA Dataset Kaggle for providing the data used in this project. Please email us if you have any questions or concerns regarding the project.
