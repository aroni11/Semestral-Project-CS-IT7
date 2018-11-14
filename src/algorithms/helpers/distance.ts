import Vertex from '../models/vertex';

// TODO: So far, euclidean distance is used.
export default (v1: Vertex, v2: Vertex): number => {
  const lngSq = Math.pow((v1.lng - v2.lng), 2);
  const latSq = Math.pow((v1.lat - v2.lat), 2);
  return Math.sqrt(latSq + lngSq);
};
