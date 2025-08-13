import codeReplace from './services/codeReplace/index.ts';

export default async function main(_token: string, {actualCode, newCode, filePath} : {actualCode: string, newCode: string, filePath: string}): Promise<{ code: string }> {
  const res = await codeReplace({
    actualCode,
    newCode,
    filePath
  })
  return { code: res };
}
