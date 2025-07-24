import { useState } from "react"

export const SampleStar = () => {
    const [value,setValue] = useState(0);

    return(
        <div style={{fontSize:30}}>
            {[1,2,3,4,5].map(n => (
                <span
                    key={n}
                    style={{cursor: "pointer", color: value >= n ? "gold" : "#ddd"}}
                    onClick={() => setValue(n)}
                    >
                    ★
                </span>
            ))}
            <span style={{marginLeft:16}}>{value} / 5</span>
        </div>
    )
}