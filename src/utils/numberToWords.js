export function numberToWords(n) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (n === 0) return 'Zero';
  
  const convertLessThanThousand = (num) => {
    if (num === 0) return '';
    if (num < 20) return ones[num] + ' ';
    if (num < 100) return tens[Math.floor(num / 10)] + ' ' + convertLessThanThousand(num % 10);
    return ones[Math.floor(num / 100)] + ' Hundred ' + convertLessThanThousand(num % 100);
  };
  
  let result = '';
  if (n >= 10000000) {
    result += convertLessThanThousand(Math.floor(n / 10000000)) + ' Crore ';
    n %= 10000000;
  }
  if (n >= 100000) {
    result += convertLessThanThousand(Math.floor(n / 100000)) + ' Lac ';
    n %= 100000;
  }
  if (n >= 1000) {
    result += convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand ';
    n %= 1000;
  }
  result += convertLessThanThousand(n);
  
  return result.trim() + ' Rupees Only';
}
