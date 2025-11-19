const primeCache = new Map();

function _isPrime(num) {
    if (num < 2) return num === 1;
    for (let i = 2; i <= Math.sqrt(num); i++)
        if (num % i === 0) return false;
    return true;
}

export function precomputePrimes(start, end) {
    for (let i = start; i <= end; i++)
        if (!primeCache.has(i))
            primeCache.set(i, _isPrime(i));
}

export function checkIsPrime(n) {
    return primeCache.get(n) || false;
}
