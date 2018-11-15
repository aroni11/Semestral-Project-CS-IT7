import { IWay } from '../../api/schema/way';

export default (way: IWay): boolean => {
  if (way.tags) { // TODO always pass the oneway tag from server?
    const keys = Object.keys(way.tags);
    const index = keys.findIndex((x) => x === 'oneway');
    return index !== -1;
  }
  return false;
};
