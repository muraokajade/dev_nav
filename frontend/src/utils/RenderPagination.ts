export const RenderPagination = (
  displayPage: number,
  totalPage: number,
  maxPageLinks: number
) => {
  //displayPageとMaxPageLinkでdisplayPageが中央にするために
  let startPage = Math.max(1, displayPage - Math.floor(maxPageLinks / 2));

  //endpageは全範囲超えない
  let endPage = startPage + maxPageLinks - 1;

  //endpageがtotalPageを超える
  if (endPage > totalPage) {
    endPage = totalPage;
    startPage = Math.max(1, endPage - maxPageLinks + 1); //常に5個見せるための+1
  }

  const pageNumbers: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return pageNumbers;
};
