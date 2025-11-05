import { act, useState } from 'react'
import './index.css'

const fakeList = [
    { id: 1, name: '项目01', active: true },
    { id: 2, name: '项目02', active: false },
]

export default function Home() {
    const [list, setList] = useState(fakeList);

    const ClickItem = (id: number) => {
        setList(list => list.map(item => ({
            ...item,
            active: item.id === id
        })))
    }

    return (
        <div className="home">
            <div className='home-name'>数据中心</div>
            <div className='home-content'>
                <div className='home-content-left'>
                    <div className='left-led'></div>
                    <div className='left-list'>
                        {list.map(item => (
                            <div key={item.id} className={`list-item ${item.active ? 'active' : ''}`} onClick={() => ClickItem(item.id)}>
                                <div className='item-led' style={{ visibility: item.active ? 'visible' : 'hidden' }}></div>
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>
                <div className='home-content-right'>
                    <div className='right-gx'>
                        <div className='gx-options'>
                            <div className='option-import'>导入新数据</div>
                            <div className='option-name'>光纤状态</div>
                            <div className='option-time'>数据报表</div>
                        </div>
                    </div>
                    <div className='right-camera'></div>
                </div>
            </div>
        </div>
    )
}