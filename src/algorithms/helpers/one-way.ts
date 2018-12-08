import { IWay } from '../../api/schema/way';

export default (way: IWay): boolean => {
  if (way.tags) {
    const tags: any = way.tags;
    const conditions = [
      tags.oneway === 'yes',
      tags.junction === 'roundabout'
    ];
    return conditions.reduce((prev, next) => prev || next);
  }
  return false;
};
