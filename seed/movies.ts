export const movies = [
  {
    movieId: 1234,
    title: "The Shawshank Redemption",
    releaseDate: "1994-09-23",
    overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
  },
  {
    movieId: 2345,
    title: "The Godfather",
    releaseDate: "1972-03-24",
    overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."
  },
  {
    movieId: 3456,
    title: "The Dark Knight",
    releaseDate: "2008-07-18",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests."
  }
];

export const actors = [
  {
    actorId: 5678,
    name: "Morgan Freeman",
    bio: "Born in Memphis, Tennessee. After serving in the U.S. Air Force, he began his acting career in New York.",
    dateOfBirth: "1937-06-01"
  },
  {
    actorId: 6789,
    name: "Tim Robbins",
    bio: "Born in West Covina, California. An accomplished actor, screenwriter, director, and producer.",
    dateOfBirth: "1958-10-16"
  },
  {
    actorId: 7890,
    name: "Marlon Brando",
    bio: "Regarded as one of the most influential actors of the 20th century.",
    dateOfBirth: "1924-04-03"
  },
  {
    actorId: 8901,
    name: "Al Pacino",
    bio: "One of the most influential actors of all time. Known for his intense method acting style.",
    dateOfBirth: "1940-04-25"
  }
];

export const cast = [
  { movieId: 1234, actorId: 5678, roleName: "Ellis Boyd 'Red' Redding", roleDescription: "A contraband smuggler serving a life sentence." },
  { movieId: 1234, actorId: 6789, roleName: "Andy Dufresne", roleDescription: "A banker convicted of murdering his wife and her lover." },
  { movieId: 1234, actorId: 8901, roleName: "Warden Norton", roleDescription: "The corrupt warden of Shawshank prison." },
  { movieId: 2345, actorId: 7890, roleName: "Don Vito Corleone", roleDescription: "The aging patriarch of an organized crime dynasty." },
  { movieId: 2345, actorId: 8901, roleName: "Michael Corleone", roleDescription: "The youngest son who transforms into a ruthless mafia boss." },
  { movieId: 2345, actorId: 5678, roleName: "Don Zaluchi", roleDescription: "A member of the Five Families." },
  { movieId: 3456, actorId: 6789, roleName: "Bruce Wayne / Batman", roleDescription: "Billionaire vigilante who fights crime in Gotham City." },
  { movieId: 3456, actorId: 5678, roleName: "Lucius Fox", roleDescription: "CEO of Wayne Enterprises and Bruce Wayne's trusted ally." },
  { movieId: 3456, actorId: 8901, roleName: "Harvey Dent", roleDescription: "Gotham's district attorney who becomes Two-Face." }
];

export const awards = [
  { awardId: 1234, body: "Academy", category: "Best Picture", year: 1995 },
  { awardId: 2345, body: "Academy", category: "Best Picture", year: 1973 },
  { awardId: 3456, body: "Academy", category: "Best Supporting Actor", year: 2009 },
  { awardId: 2345, body: "GoldenGlobe", category: "Best Drama", year: 1973 },
  { awardId: 5678, body: "GoldenGlobe", category: "Best Supporting Actor", year: 1990 },
  { awardId: 7890, body: "Academy", category: "Best Actor", year: 1973 },
  { awardId: 8901, body: "Academy", category: "Best Actor", year: 1993 },
  { awardId: 8901, body: "BAFTA", category: "Best Actor", year: 1974 }
];