// DynamoDB conversion utilities for seeding data

export const movieToDynamoItem = (movie: any) => ({
  PutRequest: {
    Item: {
      pk: { S: `m${movie.movieId}` },
      sk: { S: "xxxx" },
      entityType: { S: "Movie" },
      movieId: { N: movie.movieId.toString() },
      title: { S: movie.title },
      releaseDate: { S: movie.releaseDate },
      overview: { S: movie.overview },
    },
  },
});

export const actorToDynamoItem = (actor: any) => ({
  PutRequest: {
    Item: {
      pk: { S: `a${actor.actorId}` },
      sk: { S: "xxxx" },
      entityType: { S: "Actor" },
      actorId: { N: actor.actorId.toString() },
      name: { S: actor.name },
      bio: { S: actor.bio },
      dateOfBirth: { S: actor.dateOfBirth },
    },
  },
});

export const castToDynamoItem = (cast: any) => ({
  PutRequest: {
    Item: {
      pk: { S: `c${cast.movieId}` },
      sk: { S: cast.actorId.toString() },
      entityType: { S: "Cast" },
      movieId: { N: cast.movieId.toString() },
      actorId: { N: cast.actorId.toString() },
      roleName: { S: cast.roleName },
      roleDescription: { S: cast.roleDescription },
    },
  },
});

export const awardToDynamoItem = (award: any) => ({
  PutRequest: {
    Item: {
      pk: { S: `w${award.awardId}` },
      sk: { S: award.body },
      entityType: { S: "Award" },
      awardId: { N: award.awardId.toString() },
      body: { S: award.body },
      category: { S: award.category },
      year: { N: award.year.toString() },
    },
  },
});