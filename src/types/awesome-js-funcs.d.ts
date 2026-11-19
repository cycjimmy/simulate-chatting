// @cycjimmy/awesome-js-funcs ships no type declarations. These shims describe
// only the two entry points this repository imports, so the source can stay
// under `strict` without a blanket `any`.

declare module '@cycjimmy/awesome-js-funcs/judgeBasic/isString' {
  const isString: (value: unknown) => value is string
  export default isString
}

declare module '@cycjimmy/awesome-js-funcs/media/isAudioPlaying' {
  const isAudioPlaying: (audio: HTMLMediaElement) => boolean
  export default isAudioPlaying
}
