S: In my course project, a coffee-shop API, we sold 12 bags of a product that had only 3 in stock.
T: I had to find out why the stock check failed, and make sure it could never happen again.

R: The test now passes on every run: 3 orders succeed and 17 get a clear "out of stock" error. I learned to test race conditions on purpose, not to wait for production to find them.
