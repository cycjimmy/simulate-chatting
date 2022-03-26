/**
 * containerTemplate
 * @param style
 * @param config
 * @returns {string}
 */
export default ({
  style,
  config,
}) => {
  const aChartListHtml = config.chartList.map((chartObj) => {
    const marginTopList = chartObj.top
      ? 'style=" margin-top: 0;"'
      : '';
    const indexAttributes = `data-index= "${chartObj.index}"`;
    const pauseAttributes = chartObj.pause
      ? 'data-pause= "true"'
      : '';
    const mutedAttributes = chartObj.muted
      ? 'data-muted= "true"'
      : '';
    const callbackAttributes = chartObj.callback
      ? 'data-callback= "true"'
      : '';
    const marginTopListContent = chartObj.top
      ? `margin-top: ${chartObj.top};`
      : '';

    const listContent = chartObj.custom
      ? chartObj.html || ''
      : `
    <img class="${style.fullImg}" width="100%" height="100%" src="${chartObj.img}" alt="image"/>
    `;

    return `
<li class="${style[chartObj.pos]}" ${marginTopList} data-delay="${chartObj.delay}"
${indexAttributes} ${pauseAttributes} ${mutedAttributes} ${callbackAttributes}>
  <div class="${style.listContent}"
  style="width: ${chartObj.w}; height: ${chartObj.h}; ${marginTopListContent}">${listContent}</div>
</li>
    `;
  });

  const chartListHtml = aChartListHtml.reduce((previous, current) => previous + current, '');

  const footerHtml = config.footer
    ? `
  <div class="${style.footer}" style="height: ${config.footer.height};">
    <img class="${style.fullImg}" width="100%" height="100%" src="${config.footer.img}" alt="image"/>
  </div>
  `
    : '';

  return `
<div class="swiper swiper-container ${style.main}">
  <div class="swiper-wrapper ${style.swiperWrapper}">
    <ul class="swiper-slide ${style.chartList}">${chartListHtml}</ul>
  </div>
</div>
${footerHtml}
  `;
};
