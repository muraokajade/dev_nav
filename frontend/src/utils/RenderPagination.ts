/**
 * ページネーションで表示するページ番号の配列を計算する関数
 * @param displayPage   現在表示しているページ（例：3）
 * @param totalPage     総ページ数（例：10）
 * @param maxPageLinks  一度に表示したいページリンク数（例：5）
 * @returns 表示すべきページ番号の配列（例：[1,2,3,4,5]）
 */
export const RenderPagination = (
  displayPage: number,
  totalPage: number,
  maxPageLinks: number
) => {
    // (1) 最初に表示するページ番号を決める（例: displayPage=5, maxPageLinks=5 → 3）
  //    現在ページが真ん中付近になるように、「最大数の半分」だけ引く
  let startPage = Math.max(1, displayPage - Math.floor(maxPageLinks / 2));

  // (2) 最後に表示するページ番号を決める、今回は5ページにしたいので、-1
  let endPage = startPage + maxPageLinks - 1;

   // (3) もし最後のページを超えてしまった場合
  //     → 最後のページをendPageに合わせて、startPageも調整
  if (endPage > totalPage) {
    endPage = totalPage;
    // 例えば「全体のページ数が少ない」などでmaxPageLinks分表示できないときは、startPageが1になるように調整
    startPage = Math.max(1, endPage - maxPageLinks + 1);
  }

  // (4) 計算されたstartPage～endPageの範囲でページ番号配列を作成
  const pageNumbers: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return pageNumbers;
};
