import type { ChartTemplateItem } from './index'

export interface ContainerTemplateConfig {
  chartList: ChartTemplateItem[]
  footer: { height?: string, img?: string } | null
}

export interface ContainerTemplateOptions {
  style: Record<string, string>
  config: ContainerTemplateConfig
}

// Renders the swiper container from the normalized configuration and the
// resolved style map.
export default function containerTemplate({
  style,
  config,
}: ContainerTemplateOptions): string {
  const chartListHtml = config.chartList.map((chartItem) => {
    const marginTopList = chartItem.top
      ? 'style=" margin-top: 0;"'
      : ''
    const indexAttributes = `data-index= "${chartItem.index}"`
    const pauseAttributes = chartItem.pause
      ? 'data-pause= "true"'
      : ''
    const mutedAttributes = chartItem.muted
      ? 'data-muted= "true"'
      : ''
    const callbackAttributes = chartItem.callback
      ? 'data-callback= "true"'
      : ''
    const marginTopListContent = chartItem.top
      ? `margin-top: ${chartItem.top};`
      : ''

    const listContent = chartItem.custom
      ? chartItem.html || ''
      : `
    <img class="${style.fullImg}" width="100%" height="100%" src="${chartItem.img}" alt="image"/>
    `

    // An omitted delay falls back to the documented default here, so the
    // player never reads the string "undefined" back out of the dataset.
    const delay = chartItem.delay ?? 1500

    return `
<li class="${style[chartItem.pos]}" ${marginTopList} data-delay="${delay}"
${indexAttributes} ${pauseAttributes} ${mutedAttributes} ${callbackAttributes}>
  <div class="${style.listContent}"
  style="width: ${chartItem.w}; height: ${chartItem.h}; ${marginTopListContent}">${listContent}</div>
</li>
    `
  })

  const footerHtml = config.footer
    ? `
  <div class="${style.footer}"${config.footer.height
    ? ` style="height: ${config.footer.height};"`
    : ''}>
    <img class="${style.fullImg}" width="100%" height="100%" src="${config.footer.img}" alt="image"/>
  </div>
  `
    : ''

  return `
<div class="swiper swiper-container ${style.main}">
  <div class="swiper-wrapper ${style.swiperWrapper}">
    <ul class="swiper-slide ${style.chartList}">${chartListHtml.join('')}</ul>
  </div>
</div>
${footerHtml}
  `
}
