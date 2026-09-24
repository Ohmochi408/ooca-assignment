// Where the sky's fixed parts sit, shared by Time Sky, My Sky and the sky screen so they line up at every size.
// Header: a 960px column. Bottom controls: a 420px column — on a phone both are just the screen minus 16px sides.
// short: (a phone turned sideways): the header moves up, the arrows go to the sides, the controls to the corners.
export const HEADER = 'fg absolute top-8 short:top-4 inset-x-4 mx-auto max-w-[960px] z-30 flex items-start justify-between gap-3';
export const ARROWS =
  'fg absolute bottom-[115px] inset-x-4 mx-auto max-w-[420px] z-20 flex justify-between pointer-events-none [&>*]:pointer-events-auto short:bottom-auto short:top-1/2 short:-translate-y-1/2 short:max-w-none';
export const RECORD = 'fg absolute bottom-[107px] inset-x-0 z-30 flex justify-center pointer-events-none short:bottom-4 short:justify-end short:pr-4';
export const TOGGLE =
  'fg absolute bottom-[34px] inset-x-4 mx-auto max-w-[420px] z-30 flex items-center justify-center short:bottom-4 short:mx-0 short:max-w-[304px]';
