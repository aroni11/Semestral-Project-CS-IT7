import { IWay } from '../../api/schema/way';

export default (way: IWay): boolean => {
  if (way.tags) {
    const keys = Object.keys(way.tags);
    const index = keys.findIndex((x) => x === 'oneway');
    return index !== -1;
  }
  return false;
};
