S: In my course project, a coffee-shop API, we sold 12 bags of a product that had only 3 in stock.
T: I had to find out why the stock check failed, and make sure it could never happen again.
A: I reproduced it with a script that sent 20 checkout requests at the same time. I read the code and saw that I checked the stock with a SELECT and updated it later, so two requests could both see "3 left". I moved the check into the UPDATE itself, with a WHERE stock >= quantity, inside a transaction, and I added a test that runs 20 parallel checkouts and expects exactly 3 to succeed.
R: The test now passes on every run: 3 orders succeed and 17 get a clear "out of stock" error. I learned to test race conditions on purpose, not to wait for production to find them.
