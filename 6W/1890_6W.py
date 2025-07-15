N = int(input())
board = [list(map(int, input().split())) for _ in range(N)]

dp = [[0] * N for _ in range(N)]
dp[0][0] = 1 

for i in range(N):
    for j in range(N):
        if dp[i][j] == 0 or board[i][j] == 0:
            continue
        jump = board[i][j]
        if i + jump < N:
            dp[i + jump][j] += dp[i][j]
        if j + jump < N:
            dp[i][j + jump] += dp[i][j]

print(dp[N - 1][N - 1])

