const getMostProminentTagFromEvent = (event) => {
  let mostProminentTag = undefined;
  let highestCount = 0;

  event.foundTags.forEach((tag) => {
    if (tag.count > highestCount) {
      highestCount = tag.count;
      mostProminentTag = tag.id;
    }
  });

  return mostProminentTag;
};

module.exports = getMostProminentTagFromEvent;
